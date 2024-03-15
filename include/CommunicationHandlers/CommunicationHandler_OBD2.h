#include "Variable.h"
#include "ICommunicationService.h"
#include "Operations/Operation_Package.h"

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
		OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *_variableMap;
		const OBD2VariableMap *_obd2VariableMap;
	public:
		CommunicationHandler_OBD2(OperationArchitecture::GeneratorMap<OperationArchitecture::Variable> *variableMap, const OBD2VariableMap *obd2VariableMap);
		size_t Receive(EmbeddedIOServices::communication_send_callback_t sendCallBack, void* buf, size_t length);
	};
}
#endif