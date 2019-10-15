#include "Variables/Variable_StaticScalar.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/EmbeddedVariablesRegister.h"
#include "Service/IService.h"

using namespace HardwareAbstraction;
using namespace Service;

#ifdef VARIABLE_STATICSCALAR_H
namespace Variables
{
	Variable_StaticScalar::Variable_StaticScalar(const ScalarVariable &staticValue)
	{
		_staticValue = staticValue;
		Value = _staticValue;
	}
	
	void Variable_StaticScalar::TranslateValue()
	{
		Value = _staticValue;
	}

	IVariable *Variable_StaticScalar::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
        const uint32_t variableId = IService::CastAndOffset<uint16_t>(config, sizeOut);
		const ScalarVariable staticValue = IService::CastAndOffset<ScalarVariable>(config, sizeOut);

		Variable_StaticScalar *variableService = new Variable_StaticScalar(staticValue);
        serviceLocator->LocateAndCast<CallBackGroup>(MAIN_LOOP_CALL_BACK_GROUP)->Add(new CallBack<Variable_StaticScalar>(variableService, &Variable_StaticScalar::TranslateValue));

        serviceLocator->Register(BUILDER_VARIABLE, variableId, &variableService->Value);

		return variableService;
	}
	ISERVICE_REGISTERFACTORY_CPP(Variable_StaticScalar, 13)
}
#endif
