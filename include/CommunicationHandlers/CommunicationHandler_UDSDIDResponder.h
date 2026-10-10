#include "ICommunicationService.h"
#include "Operations/AbstractOperation.h"

#include <cstdint>
#include <map>

#ifndef COMMUNICATIONHANDLER_UDSDIDRESPONDER_H
#define COMMUNICATIONHANDLER_UDSDIDRESPONDER_H

namespace EFIGenie
{
	class CommunicationHandler_OBD2PIDResponder;

	/**
	 * Handles framed UDS Service 22 requests with 16-bit DIDs.
	 * Operations have no parameters and one return value, serialized in network
	 * byte order for scalars and unchanged for byte arrays, as in OBD2PID.
	 * Operations and mirrored PID responders are borrowed and must outlive their
	 * registrations. Mirroring is synchronous through the PID responder's Receive
	 * method and does not send an OBD request on the communication service.
	 */
	class CommunicationHandler_UDSDIDResponder
	{
	public:
		explicit CommunicationHandler_UDSDIDResponder(EmbeddedIOServices::ICommunicationService *communicationService);
		~CommunicationHandler_UDSDIDResponder();

		CommunicationHandler_UDSDIDResponder(const CommunicationHandler_UDSDIDResponder &) = delete;
		CommunicationHandler_UDSDIDResponder &operator=(const CommunicationHandler_UDSDIDResponder &) = delete;

		bool RegisterDID(uint16_t did, OperationArchitecture::AbstractOperation *operation);
		void UnregisterDID(uint16_t did);

		// Maps (highByte << 8) | PID to the responder, including supported-PID
		// bitmaps. Explicit DID registrations take precedence. Replaces a mirror
		// at the same high byte; nullptr is rejected without changing registration.
		bool RegisterOBD2PIDMirror(uint8_t highByte, CommunicationHandler_OBD2PIDResponder *responder);
		void UnregisterOBD2PIDMirror(uint8_t highByte);

		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
			const void *data, size_t length);

	private:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_receive_callback_id_t _receiveCallbackId;
		std::map<uint16_t, OperationArchitecture::AbstractOperation *> _operations;
		std::map<uint8_t, CommunicationHandler_OBD2PIDResponder *> _pidMirrors;
	};
}

#endif
