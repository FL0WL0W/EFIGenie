#include "Variables/Variable_Operation.h"
#include "Operations/Operation_FaultDetection.h"

#ifdef OPERATION_FAULTDETECTION_H
namespace Operations
{
	Operation_FaultDetection::Operation_FaultDetection(const Operation_FaultDetectionConfig * const &config)
	{
		_config = config;
	}

	ScalarVariable Operation_FaultDetection::Execute(ScalarVariable x)
	{
		float test = x.To<float>();
		if(test < _config->MinValue || test > _config->MaxValue)
		{
			switch(x.Type)
			{
				case UINT8:
					return ScalarVariable(static_cast<uint8_t>(_config->DefaultValue));
				case UINT16:
					return ScalarVariable(static_cast<uint16_t>(_config->DefaultValue));
				case UINT32:
					return ScalarVariable(static_cast<uint32_t>(_config->DefaultValue));
				// case TICK:
				// 	return ScalarVariable.FromTick(static_cast<uint32_t>(_config->DefaultValue));
				case UINT64:
					return ScalarVariable(static_cast<uint64_t>(_config->DefaultValue));
				case INT8:
					return ScalarVariable(static_cast<int8_t>(_config->DefaultValue));
				case INT16:
					return ScalarVariable(static_cast<int16_t>(_config->DefaultValue));
				case INT32:
					return ScalarVariable(static_cast<int32_t>(_config->DefaultValue));
				case INT64:
					return ScalarVariable(static_cast<int64_t>(_config->DefaultValue));
				case FLOAT:
					return ScalarVariable(_config->DefaultValue);
				case DOUBLE:
					return ScalarVariable(static_cast<double>(_config->DefaultValue));
				case BOOLEAN:
					return ScalarVariable(static_cast<bool>(_config->DefaultValue));
			}
		}
		return x;
	}

	IOperationBase *Operation_FaultDetection::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const Operation_FaultDetectionConfig *faultConfig = reinterpret_cast<const Operation_FaultDetectionConfig *>(config);
		sizeOut += faultConfig->Size();
		return new Operation_FaultDetection(faultConfig);
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_FaultDetection, 9, ScalarVariable, ScalarVariable)
}
#endif