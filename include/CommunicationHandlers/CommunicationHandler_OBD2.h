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
		uint32_t FuelTrimID[4];
		uint32_t FuelPressureID;
		uint32_t IntakeManifoldPressureID;
	};

	class CommunicationHandler_OBD2
	{
	protected:
		EmbeddedIOServices::ICommunicationService *_communicationService;
		OperationArchitecture::SystemBus *_systemBus;
		const OBD2VariableMap *_variableMap;
		EmbeddedIOServices::communication_callback_t _communicationHandler;
	public:
		CommunicationHandler_OBD2(EmbeddedIOServices::ICommunicationService *communicationService, OperationArchitecture::SystemBus *systemBus, const OBD2VariableMap *variableMap);
		~CommunicationHandler_OBD2();
		size_t Receive(void* buf, size_t length);
	};
}
#endif