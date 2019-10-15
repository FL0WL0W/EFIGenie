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
uint16									1(FactoryID)
float 									MinValue
float 									MaxValue
uint8 									Degree
float[Degree]							A(coefficients)

To use this operator on a variable in the main loop
uint16									7001(BUILDER_VARIABLE)
uint16									1(FactoryID)
uint16									xx(InstanceID of Variable Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable Input)

To create a CallBack to use this operator on a variable
uint16									7002(BUILDER_VARIABLE_TRANSLATE_CALL_BACK)
uint16									xx(InstanceID of CallBack)
uint16									1(FactoryID)
uint16									xx(InstanceID of Variable Result)
uint16									xx(InstanceID of Operation)
uint16									xx(InstanceID of Variable Input)
*/

#ifndef OPERATION_POLYNOMIAL_H
#define OPERATION_POLYNOMIAL_H
namespace Operations
{
	PACK(
	struct Operation_PolynomialConfig
	{
	private:
		Operation_PolynomialConfig()
		{
			
		}
		
	public:		
		constexpr const unsigned int Size() const
		{
			return sizeof(Operation_PolynomialConfig) + sizeof(float) * (Degree + 1);
		}

		constexpr const float *A() const { return reinterpret_cast<const float *>(this + 1); }

		float MinValue;
		float MaxValue;
		uint8_t Degree;
	});

	class Operation_Polynomial : public IOperation<ScalarVariable, ScalarVariable>
	{
	protected:
		const Operation_PolynomialConfig *_config;
	public:		
        Operation_Polynomial(const Operation_PolynomialConfig * const &config);

		ScalarVariable Execute(ScalarVariable x) override;

		static IOperationBase *Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
		ISERVICE_REGISTERFACTORY_H
	};
}
#endif