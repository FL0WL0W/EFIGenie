#include "Operations/Operation_StaticScalar.h"

#ifdef OPERATION_STATICSCALAR_H
namespace Operations
{
	Operation_StaticScalar::Operation_StaticScalar(const ScalarVariable &staticValue)
	{
		_staticValue = staticValue;
	}

	ScalarVariable Operation_StaticScalar::Execute()
	{
		return _staticValue;
	}

	IOperationBase * Operation_StaticScalar::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
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
		
		Operation_StaticScalar *variableService = new Operation_StaticScalar(*staticValue);

		return variableService;
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_StaticScalar, 13)
}
#endif