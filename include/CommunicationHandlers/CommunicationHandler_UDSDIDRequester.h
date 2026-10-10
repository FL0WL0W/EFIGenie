#include "ICommunicationService.h"

#include <cstdint>
#include <functional>
#include <map>
#include <memory>

#ifndef COMMUNICATIONHANDLER_UDSDIDREQUESTER_H
#define COMMUNICATIONHANDLER_UDSDIDREQUESTER_H

namespace EFIGenie
{
	/** Requests one 16-bit DID per Service 22 transaction. Receive expects a
	 * framed single-DID positive response; payload lengths are application-defined. */
	class CommunicationHandler_UDSDIDRequester
	{
	public:
		using received_did_callback_t = std::function<void(const void *data, size_t length)>;
		using received_did_callback_id_t = uint32_t;

		explicit CommunicationHandler_UDSDIDRequester(EmbeddedIOServices::ICommunicationService *communicationService);
		~CommunicationHandler_UDSDIDRequester();

		CommunicationHandler_UDSDIDRequester(const CommunicationHandler_UDSDIDRequester &) = delete;
		CommunicationHandler_UDSDIDRequester &operator=(const CommunicationHandler_UDSDIDRequester &) = delete;

		bool RequestDID(uint16_t did);
		received_did_callback_id_t RegisterReceivedDID(uint16_t did, received_did_callback_t callback);
		void UnregisterReceivedDID(received_did_callback_id_t callbackId);
		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
			const void *data, size_t length);

	private:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_receive_callback_id_t _receiveCallbackId;
		std::multimap<uint16_t, std::shared_ptr<received_did_callback_t>> _receivedDIDCallbackDIDIndex;
		std::map<received_did_callback_id_t, std::shared_ptr<received_did_callback_t>> _receivedDIDCallbacks;
		received_did_callback_id_t _nextReceivedDIDCallbackId = 0;
	};
}

#endif
