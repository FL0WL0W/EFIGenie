#include "ICommunicationService.h"
#include "Operations/AbstractOperation.h"

#include <cstdint>
#include <map>

#ifndef COMMUNICATIONHANDLER_OBD2PID_H
#define COMMUNICATIONHANDLER_OBD2PID_H

namespace EFIGenie
{
	/**
	 * Handles OBD-II Service 01 PIDs and UDS Service 22 DIDs through a
	 * shared diagnostic-data identifier map.
	 *
	 * Operations registered for a PID must have no parameters and exactly one
	 * return value. The bytes in that return Variable are sent as the PID payload.
	 * Registered operations are borrowed and must outlive this object (or be
	 * unregistered before they are destroyed).
	 */
	class CommunicationHandler_OBD2PID
	{
	public:
		explicit CommunicationHandler_OBD2PID(EmbeddedIOServices::ICommunicationService *communicationService);
		~CommunicationHandler_OBD2PID();

		CommunicationHandler_OBD2PID(const CommunicationHandler_OBD2PID &) = delete;
		CommunicationHandler_OBD2PID &operator=(const CommunicationHandler_OBD2PID &) = delete;

		bool RegisterPID(uint16_t pid, OperationArchitecture::AbstractOperation *operation);
		void UnregisterPID(uint16_t pid);
		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallback,
			const void *data, size_t length);

	private:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_receive_callback_id_t _receiveCallbackId;
		std::map<uint16_t, OperationArchitecture::AbstractOperation *> _operations;
	};
}

#endif
