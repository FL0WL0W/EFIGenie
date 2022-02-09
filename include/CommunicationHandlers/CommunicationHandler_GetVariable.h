#include "Variable.h"
#include "Operations/OperationPackager.h"
#include "ICommunicationService.h"

#ifndef COMMUNICATIONHANDLER_GETVARIABLE_H
#define COMMUNICATIONHANDLER_GETVARIABLE_H
namespace EFIGenie
{	
	class CommunicationHandler_GetVariable
	{
	protected:
		OperationArchitecture::SystemBus *_systemBus;
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_callback_t _communicationHandler;
	public:
		CommunicationHandler_GetVariable(EmbeddedIOServices::ICommunicationService *communicationService, OperationArchitecture::SystemBus *systemBus);
		~CommunicationHandler_GetVariable();
		size_t Receive(void* buf, size_t length);
	};
}
#endif