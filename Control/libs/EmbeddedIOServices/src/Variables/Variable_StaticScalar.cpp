#include "Variables/Variable_StaticScalar.h"
#include "Service/HardwareAbstractionServiceBuilder.h"
#include "Service/EmbeddedVariablesRegister.h"
#include "Service/IService.h"

using namespace HardwareAbstraction;
using namespace Service;

#ifdef VARIABLE_STATICSCALAR_H
namespace Variables
{
	Variable_StaticScalar::Variable_StaticScalar(ScalarVariable *variable, const ScalarVariable &staticValue)
	{
		_staticValue = staticValue;
		_variable = variable;
		*_variable = _staticValue;
	}
	
	void Variable_StaticScalar::TranslateValue()
	{
		*_variable = _staticValue;
	}

	IVariable *Variable_StaticScalar::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		ScalarVariable *variable = GetOrCreateVariable<ScalarVariable>(serviceLocator, Service::IService::CastAndOffset<uint16_t>(config, sizeOut));
		const ScalarVariableType staticValueType = IService::CastAndOffset<ScalarVariableType>(config, sizeOut);
		ScalarVariable *staticValue;
		switch (staticValueType)
		{
			case ScalarVariableType::UINT8:
				staticValue = new ScalarVariable(IService::CastAndOffset<uint8_t>(config, sizeOut));
				break;
			case ScalarVariableType::UINT16:
				staticValue = new ScalarVariable(IService::CastAndOffset<uint16_t>(config, sizeOut));
				break;
			case ScalarVariableType::UINT32:
				staticValue = new ScalarVariable(IService::CastAndOffset<uint32_t>(config, sizeOut));
				break;
			case ScalarVariableType::TICK:
				//staticValue = &ScalarVariable::FromTick(IService::CastAndOffset<uint32_t>(config, sizeOut));
				break;
			case ScalarVariableType::UINT64:
				staticValue = new ScalarVariable(IService::CastAndOffset<uint64_t>(config, sizeOut));
				break;
			case ScalarVariableType::INT8:
				staticValue = new ScalarVariable(IService::CastAndOffset<int8_t>(config, sizeOut));
				break;
			case ScalarVariableType::INT16:
				staticValue = new ScalarVariable(IService::CastAndOffset<int16_t>(config, sizeOut));
				break;
			case ScalarVariableType::INT32:
				staticValue = new ScalarVariable(IService::CastAndOffset<int32_t>(config, sizeOut));
				break;
			case ScalarVariableType::INT64:
				staticValue = new ScalarVariable(IService::CastAndOffset<int64_t>(config, sizeOut));
				break;
			case ScalarVariableType::FLOAT:
				staticValue = new ScalarVariable(IService::CastAndOffset<float>(config, sizeOut));
				break;
			case ScalarVariableType::DOUBLE:
				staticValue = new ScalarVariable(IService::CastAndOffset<double>(config, sizeOut));
				break;
			case ScalarVariableType::BOOLEAN:
				staticValue = new ScalarVariable(IService::CastAndOffset<bool>(config, sizeOut));
				break;
		}
		
		Variable_StaticScalar *variableService = new Variable_StaticScalar(variable, *staticValue);

		return variableService;
	}
	ISERVICE_REGISTERFACTORY_CPP(Variable_StaticScalar, 13)
}
#endif
