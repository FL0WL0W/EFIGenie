#include "CommunicationHandlers/CommunicationHandler_OBD2PIDResponder.h"
#include "CommunicationHandlers/DiagnosticDataPayload.h"

namespace EFIGenie
{
	CommunicationHandler_OBD2PIDResponder::CommunicationHandler_OBD2PIDResponder(EmbeddedIOServices::ICommunicationService *communicationService) :
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

	CommunicationHandler_OBD2PIDResponder::~CommunicationHandler_OBD2PIDResponder()
	{
		if(_communicationService != nullptr)
			_communicationService->UnRegisterReceiveCallBack(_receiveCallbackId);
	}

	bool CommunicationHandler_OBD2PIDResponder::RegisterPID(uint8_t pid, OperationArchitecture::AbstractOperation *operation)
	{
		if(operation == nullptr)
			return false;

		_operations[pid] = operation;
		return true;
	}

	void CommunicationHandler_OBD2PIDResponder::UnregisterPID(uint8_t pid)
	{
		_operations.erase(pid);
	}

	size_t CommunicationHandler_OBD2PIDResponder::Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
		const void *data, size_t length)
	{
		if(data == nullptr || length == 0)
			return 0;

		const uint8_t *request = static_cast<const uint8_t *>(data);
		if(request[0] != 0x01)
			return 0;

		if(length < 2)
			return 0; //we might have more info in a subsequent call, but we don't have it yet, so we can't process this request, we shouldn't get here because all messages should be framed already

		const uint8_t pid = request[1];
		if(pid % 0x20 == 0)
		{
			uint8_t response[6] = { 0x41, pid, 0, 0, 0, 0 };
			uint8_t *supportedPIDs = response + 2;
			for(const auto &registeredOperation : _operations)
			{
				const uint16_t registeredPID = registeredOperation.first;
				if(registeredPID > pid && registeredPID <= static_cast<uint16_t>(pid) + 0x20)
				{
					const uint8_t offset = static_cast<uint8_t>(registeredPID - pid - 1);
					supportedPIDs[offset / 8] |= static_cast<uint8_t>(0x80 >> (offset % 8));
				}
			}

			const uint16_t nextPagePID = static_cast<uint16_t>(pid) + 0x20;
			if(nextPagePID <= 0xff && _operations.upper_bound(static_cast<uint8_t>(nextPagePID)) != _operations.end())
				supportedPIDs[3] |= 0x01;

			sendCallback(response, sizeof(response));
			return 2;
		}

		const auto operation = _operations.find(pid);
		if(operation == _operations.end())
			return 2;

		std::vector<uint8_t> response = { 0x41, pid };
		if(AppendOperationResult(operation->second, response))
			sendCallback(response.data(), response.size());

		return 2;
	}
}
