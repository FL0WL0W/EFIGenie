#include "Variable.h"
#include "Operations/OperationPackager.h"
#include "ICommunicationService.h"

#ifndef COMMUNICATIONHANDLER_OBD2_H
#define COMMUNICATIONHANDLER_OBD2_H
namespace EFIGenie
{	
	struct OBD2VariableMap {
		uint32_t CalculatedEngineLoadID;
		uint32_t EngineCoolantTempID;
	};

	class CommunicationHandler_OBD2
	{
	protected:
		OperationArchitecture::SystemBus *_systemBus;
		EmbeddedIOServices::ICommunicationService *_communicationService;
		EmbeddedIOServices::communication_callback_t _communicationHandler;
		const OBD2VariableMap *_variableMap;
	public:
		CommunicationHandler_OBD2(EmbeddedIOServices::ICommunicationService *communicationService, OperationArchitecture::SystemBus *systemBus, const OBD2VariableMap *variableMap);
		~CommunicationHandler_OBD2();
		size_t Receive(void* buf, size_t length);
	};
}
#endif