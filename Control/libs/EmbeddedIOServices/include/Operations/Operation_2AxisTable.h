#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"

/*
To create this operator
uint16									6001(BUILDER_OPERATION)
uint16									xx(InstanceID of Operation)
uint16									3(FactoryID)
float 									MinXValue
float 									MaxXValue
uint8 									XResolution
float 									MinYValue
float 									MaxYValue
uint8 									YResolution
ScalarVariableType							TableType
TableType[XResolution * YResolution]	Table

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									5(FactoryID)
uint16									xx(InstanceID of Variable Z/Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable X)
uint16									xx(InstanceID of Variable Y)

To create a CallBack to use this operator on a variable
uint16									7002(BUILDER_VARIABLE_TRANSLATE_CALL_BACK)
uint16									xx(InstanceID of CallBack)
uint16									5(FactoryID)
uint16									xx(InstanceID of Variable Z/Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable X)
uint16									xx(InstanceID of Variable Y)
*/

#ifndef OPERATION_2AXISTABLE_H
#define OPERATION_2AXISTABLE_H
namespace Operations
{
	PACK(
	struct Operation_2AxisTableConfig
	{
	private:
		Operation_2AxisTableConfig()
		{
			
		}
		
	public:		
		constexpr const unsigned int Size() const
		{
			return sizeof(Operation_2AxisTableConfig) +
				(ScalarVariableTypeSizeOf(TableType) * XResolution * YResolution);
		}

		constexpr const void *Table() const { return this + 1; }
		
		float MinXValue;
		float MaxXValue;
		uint8_t XResolution;
		float MinYValue;
		float MaxYValue;
		uint8_t YResolution;
		ScalarVariableType TableType;
	});

	class Operation_2AxisTable : public IOperation<ScalarVariable, ScalarVariable, ScalarVariable>
	{
	protected:
		const Operation_2AxisTableConfig *_config;
	public:		
        Operation_2AxisTable(const Operation_2AxisTableConfig * const &config);

		ScalarVariable Execute(ScalarVariable x, ScalarVariable y) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif