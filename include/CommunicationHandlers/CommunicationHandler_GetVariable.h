#include "Variable.h"
#include <map>
#include "ICommunicationService.h"

#ifndef COMMUNICATIONHANDLER_GETVARIABLE_H
#define COMMUNICATIONHANDLER_GETVARIABLE_H
namespace EFIGenie
{	
	class CommunicationHandler_GetVariable
	{
	protected:
		std::map<uint32_t, OperationArchitecture::Variable*> *_variableMap;
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_callback_t _communicationHandler;
	public:
		CommunicationHandler_GetVariable(EmbeddedIOServices::ICommunicationService *communicationService, std::map<uint32_t, OperationArchitecture::Variable*> *variableMap);
		~CommunicationHandler_GetVariable();
		size_t Receive(void* buf, size_t length);
	};
}
#endif