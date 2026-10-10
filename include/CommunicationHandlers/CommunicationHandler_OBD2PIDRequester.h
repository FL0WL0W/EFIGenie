#include "ICommunicationService.h"

#include <cstdint>
#include <functional>
#include <map>
#include <memory>

#ifndef COMMUNICATIONHANDLER_OBD2PIDREQUESTER_H
#define COMMUNICATIONHANDLER_OBD2PIDREQUESTER_H

namespace EFIGenie
{
	class CommunicationHandler_OBD2PIDRequester
	{
	public:
		using received_pid_callback_t = std::function<void(const void *data, size_t length)>;
		using received_pid_callback_id_t = uint32_t;

		explicit CommunicationHandler_OBD2PIDRequester(EmbeddedIOServices::ICommunicationService *communicationService);
		~CommunicationHandler_OBD2PIDRequester();

		CommunicationHandler_OBD2PIDRequester(const CommunicationHandler_OBD2PIDRequester &) = delete;
		CommunicationHandler_OBD2PIDRequester &operator=(const CommunicationHandler_OBD2PIDRequester &) = delete;

		bool RequestPID(uint8_t pid);
		received_pid_callback_id_t RegisterReceivedPID(uint8_t pid, received_pid_callback_t callback);
		void UnregisterReceivedPID(received_pid_callback_id_t callbackId);
		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
			const void *data, size_t length);

	private:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_receive_callback_id_t _receiveCallbackId;
		std::multimap<uint8_t, std::shared_ptr<received_pid_callback_t>> _receivedPIDCallbackPIDIndex;
		std::map<received_pid_callback_id_t, std::shared_ptr<received_pid_callback_t>> _receivedPIDCallbacks;
		received_pid_callback_id_t _nextReceivedPIDCallbackId = 0;
	};
}

#endif
