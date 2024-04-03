#include "CommunicationHandlers/CommunicationHandler_EFIGenie.h"

using namespace EmbeddedIOServices;
using namespace EmbeddedIOOperations;
using namespace OperationArchitecture;

#ifdef COMMUNICATIONHANDLER_EFIGENIE_H
namespace EFIGenie
{	
	CommunicationHandler_EFIGenie::CommunicationHandler_EFIGenie(GeneratorMap<Variable> *variableMap, 
		communicationhandler_efigenie_write_t writeCallback, 
		communicationhandler_quit_t quitCallback, 
		communicationhandler_start_t startCallback,
		const void *config)
	{
		const char ack[1] = {6};
		const char nack[1] = {21};

		//Get Variable
    	_getVariableHandler = new CommunicationHandler_GetVariable(variableMap);
    	RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length){ return _getVariableHandler->Receive(send, data, length);}, "g", 1);

		//Read
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			const size_t minDataSize = sizeof(void *) + sizeof(size_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			const void *readData = *reinterpret_cast<void * const *>(data);
			const size_t readDataLength = *reinterpret_cast<const size_t *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *));
			send(readData, readDataLength);

			return minDataSize;
		}, "r", 1);

		//Write
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			const size_t minDataSize = sizeof(void *) + sizeof(size_t);
			if(length < minDataSize)
				return static_cast<size_t>(0);

			void *writeDataDest = *reinterpret_cast<void * const *>(data);
			const size_t writeDataLength = *reinterpret_cast<const size_t *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *));
			const void *writeData = reinterpret_cast<const void *>(reinterpret_cast<const uint8_t *>(data) + sizeof(void *) + sizeof(size_t));

			if(length < minDataSize + writeDataLength)
				return static_cast<size_t>(0);

			if(writeCallback(writeDataDest, writeData, writeDataLength))
				send(ack, sizeof(ack));
			else
				send(nack, sizeof(nack));

			return minDataSize + writeDataLength;
		}, "w", 1);

		//quit
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			if(quitCallback())
				send(ack, sizeof(ack));
			else
				send(nack, sizeof(nack));

			return static_cast<size_t>(0);
		}, "q", 1, false);

		//start
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			if(startCallback())
				send(ack, sizeof(ack));
			else
				send(nack, sizeof(nack));
				
			return static_cast<size_t>(0);
		}, "s", 1, false);

		//metadata read 64 bytes
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			if(length < sizeof(uint32_t))//make sure there are enough bytes to process a request
				return static_cast<size_t>(0);
			const uint8_t offset = *reinterpret_cast<const uint32_t *>(data); //grab offset from data

			const void *metadata = reinterpret_cast<const uint8_t *>(config) + (*reinterpret_cast<const uint32_t *>(config) + 2 * sizeof(uint32_t));
			send(reinterpret_cast<const uint8_t *>(metadata) + offset * 64, 64);

			return static_cast<size_t>(sizeof(uint32_t));//return number of bytes handled
		}, "m", 1);

		//config location
		RegisterReceiveCallBack([&](communication_send_callback_t send, const void *data, size_t length)
		{ 
			size_t configLocation[1] = { reinterpret_cast<size_t>(config) };
			send(configLocation, sizeof(configLocation));
			
			return static_cast<size_t>(0);
		}, "c", 1, false);
	}

	CommunicationHandler_EFIGenie::~CommunicationHandler_EFIGenie() {
		delete _getVariableHandler;
	}

}
#endif