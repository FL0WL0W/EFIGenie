#include "CommunicationHandlers/CommunicationHandler_UDSDIDResponder.h"
#include "CommunicationHandlers/CommunicationHandler_OBD2PIDResponder.h"
#include "CommunicationHandlers/DiagnosticDataPayload.h"

namespace EFIGenie
{
	CommunicationHandler_UDSDIDResponder::CommunicationHandler_UDSDIDResponder(
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

	CommunicationHandler_UDSDIDResponder::~CommunicationHandler_UDSDIDResponder()
	{
		if(_communicationService != nullptr)
			_communicationService->UnRegisterReceiveCallBack(_receiveCallbackId);
	}

	bool CommunicationHandler_UDSDIDResponder::RegisterDID(uint16_t did, OperationArchitecture::AbstractOperation *operation)
	{
		if(operation == nullptr)
			return false;
		_operations[did] = operation;
		return true;
	}

	void CommunicationHandler_UDSDIDResponder::UnregisterDID(uint16_t did)
	{
		_operations.erase(did);
	}

	bool CommunicationHandler_UDSDIDResponder::RegisterOBD2PIDMirror(
		uint8_t highByte, CommunicationHandler_OBD2PIDResponder *responder)
	{
		if(responder == nullptr)
			return false;
		_pidMirrors[highByte] = responder;
		return true;
	}

	void CommunicationHandler_UDSDIDResponder::UnregisterOBD2PIDMirror(uint8_t highByte)
	{
		_pidMirrors.erase(highByte);
	}

	size_t CommunicationHandler_UDSDIDResponder::Receive(
		EmbeddedIOServices::communication_send_callback_t sendCallback, const void *data, size_t length)
	{
		if(data == nullptr || length == 0)
			return 0;
		const uint8_t *request = static_cast<const uint8_t *>(data);
		if(request[0] != 0x22)
			return 0;

		const auto sendNegative = [&](uint8_t code)
		{
			const uint8_t response[] = { 0x7f, 0x22, code };
			sendCallback(response, sizeof(response));
		};
		if(length < 3 || (length - 1) % 2 != 0)
		{
			sendNegative(0x13); // incorrectMessageLengthOrInvalidFormat
			return length;
		}

		// Validate registrations before executing operations, preserving the existing
		// all-or-negative behavior for multi-DID requests.
		for(size_t offset = 1; offset < length; offset += 2)
		{
			const uint16_t did = static_cast<uint16_t>(request[offset]) << 8 | request[offset + 1];
			if(_operations.find(did) == _operations.end() && _pidMirrors.find(request[offset]) == _pidMirrors.end())
			{
				sendNegative(0x31); // requestOutOfRange
				return length;
			}
		}

		std::vector<uint8_t> response(1, 0x62);
		for(size_t offset = 1; offset < length; offset += 2)
		{
			const uint16_t did = static_cast<uint16_t>(request[offset]) << 8 | request[offset + 1];
			response.push_back(request[offset]);
			response.push_back(request[offset + 1]);
			const auto operation = _operations.find(did);
			bool success = false;
			if(operation != _operations.end())
				success = AppendOperationResult(operation->second, response);
			else
			{
				const uint8_t pid = request[offset + 1];
				const uint8_t pidRequest[] = { 0x01, pid };
				_pidMirrors.find(request[offset])->second->Receive(
					[&](const void *data, size_t length)
					{
						const uint8_t *pidResponse = static_cast<const uint8_t *>(data);
						if(data != nullptr && length > 2 && pidResponse[0] == 0x41 && pidResponse[1] == pid)
						{
							response.insert(response.end(), pidResponse + 2, pidResponse + length);
							success = true;
						}
					}, pidRequest, sizeof(pidRequest));
			}
			if(!success)
			{
				sendNegative(0x31);
				return length;
			}
		}
		sendCallback(response.data(), response.size());
		return length;
	}
}
