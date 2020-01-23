#include "Operations/Operation_2AxisTable.h"

#ifdef OPERATION_2AXISTABLE_H
namespace Operations
{
	Operation_2AxisTable::Operation_2AxisTable(const Operation_2AxisTableConfig * const &config)
	{
		_config = config;
	}

	ScalarVariable Operation_2AxisTable::Execute(ScalarVariable x, ScalarVariable y)
	{
		switch(_config->TableType)
		{
			case ScalarVariableType::UINT8:
				return ScalarVariable(Interpolation::InterpolateTable2<uint8_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const uint8_t*>(_config->Table())));
			case ScalarVariableType::UINT16:
				return ScalarVariable(Interpolation::InterpolateTable2<uint16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const uint16_t*>(_config->Table())));
			case ScalarVariableType::UINT32:
				return ScalarVariable(Interpolation::InterpolateTable2<uint32_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const uint32_t*>(_config->Table())));
			// case ScalarVariableType::TICK:
			// 	return ScalarVariable.FromTick(Interpolation::InterpolateTable2<uint32_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const uint32_t*>(_config->Table())));
			case ScalarVariableType::UINT64:
				return ScalarVariable(Interpolation::InterpolateTable2<uint64_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const uint64_t*>(_config->Table())));
			case ScalarVariableType::INT8:
				return ScalarVariable(Interpolation::InterpolateTable2<int8_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const int8_t*>(_config->Table())));
			case ScalarVariableType::INT16:
				return ScalarVariable(Interpolation::InterpolateTable2<int16_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const int16_t*>(_config->Table())));
			case ScalarVariableType::INT32:
				return ScalarVariable(Interpolation::InterpolateTable2<int32_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const int32_t*>(_config->Table())));
			case ScalarVariableType::INT64:
				return ScalarVariable(Interpolation::InterpolateTable2<int64_t>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const int64_t*>(_config->Table())));
			case ScalarVariableType::FLOAT:
				return ScalarVariable(Interpolation::InterpolateTable2<float>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const float*>(_config->Table())));
			case ScalarVariableType::DOUBLE:
				return ScalarVariable(Interpolation::InterpolateTable2<double>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const double*>(_config->Table())));
			case ScalarVariableType::BOOLEAN:
				return ScalarVariable(Interpolation::InterpolateTable2<bool>(x.To<float>(), _config->MaxXValue, _config->MinXValue, _config->XResolution, y.To<float>(), _config->MaxYValue, _config->MinYValue, _config->YResolution, reinterpret_cast<const bool*>(_config->Table())));
		}
		return ScalarVariable(static_cast<uint8_t>(0));
	}

	IOperationBase * Operation_2AxisTable::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const Operation_2AxisTableConfig *tableConfig = reinterpret_cast<const Operation_2AxisTableConfig *>(config);
		sizeOut += tableConfig->Size();
		return new Operation_2AxisTable(tableConfig);
	}
	
	IOPERATION_REGISTERFACTORY_CPP(Operation_2AxisTable, 3)
}
#endif