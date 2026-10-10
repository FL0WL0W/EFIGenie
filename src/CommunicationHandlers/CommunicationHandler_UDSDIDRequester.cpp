#include "CommunicationHandlers/CommunicationHandler_UDSDIDRequester.h"

#include <utility>
#include <vector>

namespace EFIGenie
{
	CommunicationHandler_UDSDIDRequester::CommunicationHandler_UDSDIDRequester(
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

	CommunicationHandler_UDSDIDRequester::~CommunicationHandler_UDSDIDRequester()
	{
		if(_communicationService != nullptr)
			_communicationService->UnRegisterReceiveCallBack(_receiveCallbackId);
	}

	bool CommunicationHandler_UDSDIDRequester::RequestDID(uint16_t did)
	{
		if(_communicationService == nullptr)
			return false;

		const uint8_t request[] = { 0x22, static_cast<uint8_t>(did >> 8), static_cast<uint8_t>(did) };
		_communicationService->Send(request, sizeof(request));
		return true;
	}

	CommunicationHandler_UDSDIDRequester::received_did_callback_id_t
	CommunicationHandler_UDSDIDRequester::RegisterReceivedDID(uint16_t did, received_did_callback_t callback)
	{
		const auto sharedCallback = std::make_shared<received_did_callback_t>(std::move(callback));
		const received_did_callback_id_t callbackId = _nextReceivedDIDCallbackId++;
		_receivedDIDCallbackDIDIndex.insert({ did, sharedCallback });
		_receivedDIDCallbacks.insert({ callbackId, sharedCallback });
		return callbackId;
	}

	void CommunicationHandler_UDSDIDRequester::UnregisterReceivedDID(received_did_callback_id_t callbackId)
	{
		const auto callback = _receivedDIDCallbacks.find(callbackId);
		if(callback == _receivedDIDCallbacks.end())
			return;

		for(auto indexedCallback = _receivedDIDCallbackDIDIndex.begin();
			indexedCallback != _receivedDIDCallbackDIDIndex.end();)
		{
			if(indexedCallback->second == callback->second)
				indexedCallback = _receivedDIDCallbackDIDIndex.erase(indexedCallback);
			else
				++indexedCallback;
		}
		_receivedDIDCallbacks.erase(callback);
	}

	size_t CommunicationHandler_UDSDIDRequester::Receive(
		EmbeddedIOServices::communication_send_callback_t, const void *data, size_t length)
	{
		if(data == nullptr || length == 0)
			return 0;

		const uint8_t *response = static_cast<const uint8_t *>(data);
		if(response[0] != 0x62 || length < 3)
			return 0;

		const uint16_t did = static_cast<uint16_t>(response[1]) << 8 | response[2];
		const size_t payloadOffset = 3;
		const auto callbacks = _receivedDIDCallbackDIDIndex.equal_range(did);
		std::vector<std::shared_ptr<received_did_callback_t>> callbacksToCall;
		for(auto callback = callbacks.first; callback != callbacks.second; ++callback)
			callbacksToCall.push_back(callback->second);
		for(const auto &callback : callbacksToCall)
			(*callback)(response + payloadOffset, length - payloadOffset);
		return length;
	}
}
