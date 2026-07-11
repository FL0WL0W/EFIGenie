#include "CommunicationHandlers/CommunicationHandler_OBD2PID.h"

#include <algorithm>
#include <vector>

namespace
{
	bool IsLittleEndian()
	{
		const uint16_t value = 1;
		return *reinterpret_cast<const uint8_t *>(&value) == 1;
	}

	bool AppendOperationResult(OperationArchitecture::AbstractOperation *operation, std::vector<uint8_t> &response)
	{
		OperationArchitecture::Variable result;
		OperationArchitecture::Variable *variables[] = { &result };
		operation->AbstractExecute(variables);

		const size_t resultSize = result.Size();
		if(resultSize == 0 || result.Type == OperationArchitecture::POINTER)
			return false;

		const size_t offset = response.size();
		response.resize(offset + resultSize);
		const bool isScalar = result.Type >= OperationArchitecture::UINT8
			&& result.Type <= OperationArchitecture::DOUBLE;
		if(IsLittleEndian() && isScalar && resultSize > 1)
			std::reverse_copy(result.ValueArray, result.ValueArray + resultSize, response.begin() + offset);
		else
		{
			const uint8_t *resultData = result.Type == OperationArchitecture::BIGOTHER
				? static_cast<const uint8_t *>(result.POINTERValue)
				: result.ValueArray;
			std::copy(resultData, resultData + resultSize, response.begin() + offset);
		}
		return true;
	}

	void SendNegativeResponse(EmbeddedIOServices::communication_send_callback_t sendCallback,
		uint8_t service, uint8_t responseCode)
	{
		const uint8_t response[] = { 0x7f, service, responseCode };
		sendCallback(response, sizeof(response));
	}
}

namespace EFIGenie
{
	CommunicationHandler_OBD2PID::CommunicationHandler_OBD2PID(EmbeddedIOServices::ICommunicationService *communicationService) :
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

	CommunicationHandler_OBD2PID::~CommunicationHandler_OBD2PID()
	{
		if(_communicationService != nullptr)
			_communicationService->UnRegisterReceiveCallBack(_receiveCallbackId);
	}

	bool CommunicationHandler_OBD2PID::RegisterPID(uint16_t pid, OperationArchitecture::AbstractOperation *operation)
	{
		if(operation == nullptr || operation->NumberOfReturnVariables != 1 || operation->NumberOfParameters != 0)
			return false;

		_operations[pid] = operation;
		return true;
	}

	void CommunicationHandler_OBD2PID::UnregisterPID(uint16_t pid)
	{
		_operations.erase(pid);
	}

	size_t CommunicationHandler_OBD2PID::Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
		const void *data, size_t length)
	{
		if(data == nullptr || length == 0)
			return 0;

		const uint8_t *request = static_cast<const uint8_t *>(data);
		if(request[0] != 0x01 && request[0] != 0x22)
			return 0;

		if(request[0] == 0x22)
		{
			if(length < 3)
			{
				return 0; //we might have more info in a subsequent call, but we don't have it yet, so we can't process this request, we shouldn't get here because all messages should be framed already
			}

			for(size_t offset = 1; offset < length; offset += 2)
			{
				const uint16_t did = static_cast<uint16_t>(request[offset]) << 8 | request[offset + 1];
				if(_operations.find(did) == _operations.end())
				{
					SendNegativeResponse(sendCallback, 0x22, 0x31);
					return length;
				}
			}

			std::vector<uint8_t> response(1, 0x62);
			for(size_t offset = 1; offset < length; offset += 2)
			{
				const uint16_t did = static_cast<uint16_t>(request[offset]) << 8 | request[offset + 1];
				response.push_back(request[offset]);
				response.push_back(request[offset + 1]);
				if(!AppendOperationResult(_operations.find(did)->second, response))
				{
					SendNegativeResponse(sendCallback, 0x22, 0x31);
					return length;
				}
			}
			sendCallback(response.data(), response.size());
			return length;
		}

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
			const auto nextPageOperation = _operations.upper_bound(nextPagePID);
			if(nextPagePID <= 0xff && nextPageOperation != _operations.end() && nextPageOperation->first <= 0xff)
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
