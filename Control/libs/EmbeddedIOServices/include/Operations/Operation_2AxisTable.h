#include "Operations/IOperation.h"
#include "Service/IService.h"
#include "Service/ServiceLocator.h"
#include "Packed.h"
#include "Interpolation.h"
#include "ScalarVariable.h"

/*
To create this operator
uint16									3(FactoryID)
float 									MinXValue
float 									MaxXValue
uint8 									XResolution
float 									MinYValue
float 									MaxYValue
uint8 									YResolution
ScalarVariableType						TableType
TableType[XResolution * YResolution]	Table
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