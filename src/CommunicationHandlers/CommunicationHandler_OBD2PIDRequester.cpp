#include "CommunicationHandlers/CommunicationHandler_OBD2PIDRequester.h"

#include <utility>
#include <vector>

namespace EFIGenie
{
	CommunicationHandler_OBD2PIDRequester::CommunicationHandler_OBD2PIDRequester(
		EmbeddedIOServices::ICommunicationService *communicationService) :
		_communicationService(communicationService),
		_receiveCallbackId(0)
	{
		if(_communicationService != nullptr)
		{
			_receiveCallbackId = _communicationService->RegisterReceiveCallBack(
				[this](EmbeddedIOServices::communication_send_callback_t send, const void *data, size_t length)
				{
					return Receive(send, data, length);
				});
		}
	}

	CommunicationHandler_OBD2PIDRequester::~CommunicationHandler_OBD2PIDRequester()
	{
		if(_communicationService != nullptr)
			_communicationService->UnRegisterReceiveCallBack(_receiveCallbackId);
	}

	bool CommunicationHandler_OBD2PIDRequester::RequestPID(uint8_t pid)
	{
		if(_communicationService == nullptr)
			return false;

		const uint8_t request[] = { 0x01, pid };
		_communicationService->Send(request, sizeof(request));
		return true;
	}

	CommunicationHandler_OBD2PIDRequester::received_pid_callback_id_t
	CommunicationHandler_OBD2PIDRequester::RegisterReceivedPID(uint8_t pid, received_pid_callback_t callback)
	{
		const auto sharedCallback = std::make_shared<received_pid_callback_t>(std::move(callback));
		const received_pid_callback_id_t callbackId = _nextReceivedPIDCallbackId++;
		_receivedPIDCallbackPIDIndex.insert({ pid, sharedCallback });
		_receivedPIDCallbacks.insert({ callbackId, sharedCallback });
		return callbackId;
	}

	void CommunicationHandler_OBD2PIDRequester::UnregisterReceivedPID(received_pid_callback_id_t callbackId)
	{
		const auto callback = _receivedPIDCallbacks.find(callbackId);
		if(callback == _receivedPIDCallbacks.end())
			return;

		for(auto indexedCallback = _receivedPIDCallbackPIDIndex.begin();
			indexedCallback != _receivedPIDCallbackPIDIndex.end();)
		{
			if(indexedCallback->second == callback->second)
				indexedCallback = _receivedPIDCallbackPIDIndex.erase(indexedCallback);
			else
				++indexedCallback;
		}
		_receivedPIDCallbacks.erase(callback);
	}

	size_t CommunicationHandler_OBD2PIDRequester::Receive(
		EmbeddedIOServices::communication_send_callback_t, const void *data, size_t length)
	{
		if(data == nullptr || length == 0)
			return 0;

		const uint8_t *response = static_cast<const uint8_t *>(data);
		if(response[0] != 0x41 || length < 2)
			return 0;

		const uint8_t pid = response[1];
		const size_t payloadOffset = 2;
		const auto callbacks = _receivedPIDCallbackPIDIndex.equal_range(pid);
		std::vector<std::shared_ptr<received_pid_callback_t>> callbacksToCall;
		for(auto callback = callbacks.first; callback != callbacks.second; ++callback)
			callbacksToCall.push_back(callback->second);
		for(const auto &callback : callbacksToCall)
			(*callback)(response + payloadOffset, length - payloadOffset);
		return length;
	}
}
