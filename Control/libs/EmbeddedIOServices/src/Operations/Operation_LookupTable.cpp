#include "Operations/Operation_LookupTable.h"

#ifdef OPERATION_LOOKUPTABLE_H
namespace Operations
{
	Operation_LookupTable::Operation_LookupTable(const Operation_LookupTableConfig * const &config)
	{
		_config = config;
	}

	ScalarVariable Operation_LookupTable::Execute(ScalarVariable x)
	{
		switch(_config->TableType)
		{
			case ScalarVariableType::UINT8:
				return ScalarVariable(Interpolation::InterpolateTable1<uint8_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const uint8_t*>(_config->Table())));
			case ScalarVariableType::UINT16:
				return ScalarVariable(Interpolation::InterpolateTable1<uint16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const uint16_t*>(_config->Table())));
			case ScalarVariableType::UINT32:
				return ScalarVariable(Interpolation::InterpolateTable1<uint16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const uint16_t*>(_config->Table())));
			case ScalarVariableType::TICK:
			 	return ScalarVariable::FromTick(Interpolation::InterpolateTable1<uint16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const uint16_t*>(_config->Table())));
				//this would be useless to use
			case ScalarVariableType::UINT64:
				return ScalarVariable(Interpolation::InterpolateTable1<uint64_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const uint64_t*>(_config->Table())));
			case ScalarVariableType::INT8:
				return ScalarVariable(Interpolation::InterpolateTable1<int8_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const int8_t*>(_config->Table())));
			case ScalarVariableType::INT16:
				return ScalarVariable(Interpolation::InterpolateTable1<int16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const int16_t*>(_config->Table())));
			case ScalarVariableType::INT32:
				return ScalarVariable(Interpolation::InterpolateTable1<int32_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const int32_t*>(_config->Table())));
			case ScalarVariableType::INT64:
				return ScalarVariable(Interpolation::InterpolateTable1<int64_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const int64_t*>(_config->Table())));
			case ScalarVariableType::FLOAT:
				return ScalarVariable(Interpolation::InterpolateTable1<float>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const float*>(_config->Table())));
			case ScalarVariableType::DOUBLE:
				return ScalarVariable(Interpolation::InterpolateTable1<double>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const double*>(_config->Table())));
			case ScalarVariableType::BOOLEAN:
				return ScalarVariable(Interpolation::InterpolateTable1<bool>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, reinterpret_cast<const bool*>(_config->Table())));
			case ScalarVariableType::VOID: 
				return 0;
				//this would be useless to use
		}
		return ScalarVariable(static_cast<uint8_t>(0));
	}

	IOperationBase *Operation_LookupTable::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const Operation_LookupTableConfig *tableConfig = reinterpret_cast<const Operation_LookupTableConfig *>(config);
		sizeOut += tableConfig->Size();
		return new Operation_LookupTable(tableConfig);
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_LookupTable, 2)
}
#endif