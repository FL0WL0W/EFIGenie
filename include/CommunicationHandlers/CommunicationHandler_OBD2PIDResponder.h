#include "ICommunicationService.h"
#include "Operations/AbstractOperation.h"

#include <cstdint>
#include <map>

#ifndef COMMUNICATIONHANDLER_OBD2PIDRESPONDER_H
#define COMMUNICATIONHANDLER_OBD2PIDRESPONDER_H

namespace EFIGenie
{
	/**
	 * Handles OBD-II Service 01 requests with 8-bit PIDs.
	 *
	 * Operations registered for a PID must have no parameters and exactly one
	 * return value. The bytes in that return Variable are sent as the PID payload.
	 * Registered operations are borrowed and must outlive this object (or be
	 * unregistered before they are destroyed).
	 */
	class CommunicationHandler_OBD2PIDResponder
	{
	public:
		explicit CommunicationHandler_OBD2PIDResponder(EmbeddedIOServices::ICommunicationService *communicationService);
		~CommunicationHandler_OBD2PIDResponder();

		CommunicationHandler_OBD2PIDResponder(const CommunicationHandler_OBD2PIDResponder &) = delete;
		CommunicationHandler_OBD2PIDResponder &operator=(const CommunicationHandler_OBD2PIDResponder &) = delete;

		bool RegisterPID(uint8_t pid, OperationArchitecture::AbstractOperation *operation);
		void UnregisterPID(uint8_t pid);
		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
			const void *data, size_t length);

	private:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_receive_callback_id_t _receiveCallbackId;
		std::map<uint8_t, OperationArchitecture::AbstractOperation *> _operations;
	};
}

#endif
