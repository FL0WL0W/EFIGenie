#include "CommunicationHandlers/CommunicationHandler_EFIGenie.h"
#include "CommunicationServiceShim.h"
#include "ITimerService.h"
#include <vector>
#include <algorithm>

using namespace EmbeddedIOServices;
using namespace EmbeddedIOOperations;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_EFIGENIE_H
namespace EFIGenie
{	
	CommunicationHandler_EFIGenie::CommunicationHandler_EFIGenie(GeneratorMap<Variable> *variableMap, 
		ITimerService *timerService,
		communicationhandler_efigenie_write_t writeCallback, 
		communicationhandler_quit_t quitCallback, 
		communicationhandler_start_t startCallback,
		const void *config) :
		_getVariableHandler(variableMap),
		_timerService(timerService)
	{
		//Get Variable
    	RegisterReceiveCallBack([this](ICommunicationService *sendService, const void *data, size_t length){ return _getVariableHandler.Receive(sendService, data, length);}, "g", 1);

		//Subscribe to Variables
    	RegisterReceiveCallBack([this](ICommunicationService *sendService, const void *data, size_t length){ 
			const size_t minDataSize = sizeof(float) + sizeof(uint32_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			float interval;
			std::memcpy(&interval, data, sizeof(float));
			const tick_t intervalTick = _timerService->GetTicksPerSecond() * interval;
			const uint32_t variableId = *reinterpret_cast<const uint32_t *>(reinterpret_cast<const uint8_t *>(data) + sizeof(float));

			const char nack[1] = {21};
			Subscription subscription{sendService, variableId, intervalTick};
			if(!_subscriptionCommands.Push(subscription, 1))
				sendService->Send(nack, sizeof(nack));

			return minDataSize;
		}, "d", 1, false);

		//Unsubscribe to Variables
    	RegisterReceiveCallBack([this](ICommunicationService *sendService, const void *data, size_t length){ 
			const size_t minDataSize = sizeof(uint32_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			const uint32_t variableId = *reinterpret_cast<const uint32_t *>(data);

			const char nack[1] = {21};
			Subscription subscription{sendService, variableId, 0};
			if(!_subscriptionCommands.Push(subscription, 2))
				sendService->Send(nack, sizeof(nack));
			
			return minDataSize;
		}, "e", 1, false);

		//Read
		RegisterReceiveCallBack([](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			const size_t minDataSize = sizeof(void *) + sizeof(size_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			const void *readData = *reinterpret_cast<void * const *>(data);
			const size_t readDataLength = *reinterpret_cast<const size_t *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *));
			if(sendService->Ready())
				sendService->Send(readData, readDataLength);

			return minDataSize;
		}, "r", 1);

		//Write
		RegisterReceiveCallBack([writeCallback](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			const char ack[1] = {6};
			const char nack[1] = {21};

			const size_t minDataSize = sizeof(void *) + sizeof(size_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			void *writeDataDest = *reinterpret_cast<void * const *>(data);
			const size_t writeDataLength = *reinterpret_cast<const size_t *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *));
			const void *writeData = reinterpret_cast<const void *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *) + sizeof(size_t));

			if(length < minDataSize + writeDataLength)
				return static_cast<size_t>(0);

			const bool success = writeCallback(writeDataDest, writeData, writeDataLength);
			if(sendService->Ready())
			{
				if(success)
					sendService->Send(ack, sizeof(ack));
				else
					sendService->Send(nack, sizeof(nack));
			}

			return minDataSize + writeDataLength;
		}, "w", 1);

		//quit
		RegisterReceiveCallBack([quitCallback](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			const char ack[1] = {6};
			const char nack[1] = {21};
			
			const bool success = quitCallback();
			if(sendService->Ready())
			{
				if(success)
					sendService->Send(ack, sizeof(ack));
				else
					sendService->Send(nack, sizeof(nack));
			}

			return static_cast<size_t>(0);
		}, "q", 1, true, false);

		//start
		RegisterReceiveCallBack([startCallback](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			const char ack[1] = {6};
			const char nack[1] = {21};
			
			const bool success = startCallback();
			if(sendService->Ready())
			{
				if(success)
					sendService->Send(ack, sizeof(ack));
				else
					sendService->Send(nack, sizeof(nack));
			}
				
			return static_cast<size_t>(0);
		}, "s", 1, true, false);

		//metadata read 64 bytes
		RegisterReceiveCallBack([config](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			if(length < sizeof(uint32_t))//make sure there are enough bytes to process a request
				return static_cast<size_t>(0);
			const uint8_t offset = *reinterpret_cast<const uint32_t *>(data); //grab offset from data

			if(config == 0)
			{
				const uint32_t length = 0;
				if(sendService->Ready())
					sendService->Send(reinterpret_cast<const uint8_t *>(&length), 4);
			}
			else
			{
				const void *metadata = reinterpret_cast<const uint8_t *>(config) + (*reinterpret_cast<const uint32_t *>(config) + 2 * sizeof(uint32_t));
				if(sendService->Ready())
					sendService->Send(reinterpret_cast<const uint8_t *>(metadata) + offset * 64, 64);
			}

			return static_cast<size_t>(sizeof(uint32_t));//return number of bytes handled
		}, "m", 1);

		//config location
		RegisterReceiveCallBack([config](ICommunicationService *sendService, const void *data, size_t length)
		{ 
			size_t configLocation[1] = { reinterpret_cast<size_t>(config) };
			if(sendService->Ready())
				sendService->Send(configLocation, sizeof(configLocation));
			
			return static_cast<size_t>(0);
		}, "c", 1, true, false);
	}

	CommunicationHandler_EFIGenie::~CommunicationHandler_EFIGenie() {
	}

	void CommunicationHandler_EFIGenie::SendSubscriptions() {

		uint8_t state;
		Subscription subscription;
		while((state = _subscriptionCommands.Pop(subscription)) != 0)
		{
			if(state == 1)
			{
				//find if subscription already exists for this sendService and variableId
				auto itService = _subscriptions.find(subscription.SendService);
				if(itService == _subscriptions.end())
				{
					_subscriptions[subscription.SendService] = std::map<tick_t, std::list<uint32_t>>();
					itService = _subscriptions.find(subscription.SendService);
				}
				bool subscriptionExists = false;
				for(auto itTick = itService->second.begin(); itTick != itService->second.end(); ++itTick)
				{
					if(std::find(itTick->second.begin(), itTick->second.end(), subscription.VariableId) != itTick->second.end())
					{
						//subscription already exists. check if the intervalTick matches
						if(itTick->first == subscription.IntervalTick)
						{
							subscriptionExists = true;
						}
						else
						{
							//remove the variableId from the old intervalTick
							itTick->second.remove(subscription.VariableId);
						}
						break;
					}
				}
				if(!subscriptionExists)
				{
					itService->second[subscription.IntervalTick].push_back(subscription.VariableId);
				}
				const char ack[2] = {'d', 6};
				subscription.SendService->Send(ack, sizeof(ack));
			}
			else if(state == 2)
			{
				//remove subscription for this sendService and variableId
				auto itService = _subscriptions.find(subscription.SendService);
				if(itService != _subscriptions.end())
				{
					for(auto itTick = itService->second.begin(); itTick != itService->second.end(); ++itTick)
					{
						if(subscription.VariableId == 0xFFFFFFFF)
						{
							itTick->second.clear();
						}
						else
						{
							itTick->second.remove(subscription.VariableId);
						}
					}
				}
				const char ack[2] = {'e', 6};
				subscription.SendService->Send(ack, sizeof(ack));
			}
		}

		const tick_t currentTick = _timerService->GetTick();
		//iterate through all subscriptions and send the data if needed
		for(auto &serviceSubscriptionsPair : _subscriptions)
		{
			ICommunicationService *sendService = serviceSubscriptionsPair.first;
			if(!sendService->Ready())
				continue;

			std::list<uint32_t> variableIdsToSend;

			auto &tickMap = serviceSubscriptionsPair.second;
			std::list<tick_t> intervalsSent;
			for(auto &tickPair : tickMap)
			{
				tick_t intervalTick = tickPair.first;

				auto itServiceLastSentTick = _subscriptionsLastSentTick.find(sendService);
				if(itServiceLastSentTick == _subscriptionsLastSentTick.end())
				{
					_subscriptionsLastSentTick[sendService] = std::map<tick_t, tick_t>();
					itServiceLastSentTick = _subscriptionsLastSentTick.find(sendService);
				}
				auto itIntervalLastSentTick = itServiceLastSentTick->second.find(intervalTick);
				if(itIntervalLastSentTick != itServiceLastSentTick->second.end() && ITimerService::TickLessThanTick(currentTick, itServiceLastSentTick->second[intervalTick] + intervalTick))
					continue;

				intervalsSent.push_back(intervalTick);
				
				std::list<uint32_t> &variableIds = tickPair.second;
				//send the data for each variableId if needed
				for(uint32_t variableId : variableIds)
				{
					variableIdsToSend.push_back(variableId);
				}
			}

			if(variableIdsToSend.empty())
				continue;

			std::vector<uint8_t> buffer;
			const char stx[2] = {'d', 2};
			buffer.insert(buffer.end(), reinterpret_cast<const uint8_t *>(stx), reinterpret_cast<const uint8_t *>(stx) + sizeof(stx));
			buffer.insert(buffer.end(), reinterpret_cast<const uint8_t *>(&currentTick), reinterpret_cast<const uint8_t *>(&currentTick) + sizeof(currentTick));
			CommunicationServiceShim shim([&](const void *data, size_t length)
			{
				buffer.insert(buffer.end(), static_cast<const uint8_t *>(data), static_cast<const uint8_t *>(data) + length);
			});

			for(uint32_t variableId : variableIdsToSend)
			{
				buffer.insert(buffer.end(), reinterpret_cast<uint8_t *>(&variableId), reinterpret_cast<uint8_t *>(&variableId) + sizeof(variableId));
				_getVariableHandler.Receive(&shim, &variableId, sizeof(variableId));
			}
			const char etx[2] = {'d', 3};
			buffer.insert(buffer.end(), reinterpret_cast<const uint8_t *>(etx), reinterpret_cast<const uint8_t *>(etx) + sizeof(etx));
			if(sendService->Ready()) 
			{
				sendService->Send(buffer.data(), buffer.size());
				for(tick_t intervalTick : intervalsSent)
				{
					_subscriptionsLastSentTick[sendService][intervalTick] = currentTick;
				}
			}
		}
	}
}
#endif