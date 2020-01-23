#include "Operations/Operation_Polynomial.h"

#ifdef OPERATION_POLYNOMIAL_H
namespace Operations
{
	Operation_Polynomial::Operation_Polynomial(const Operation_PolynomialConfig * const &config)
	{
		_config = config;
	}

	ScalarVariable Operation_Polynomial::Execute(ScalarVariable xIn)
	{
		const float x = xIn.To<float>();
		const float * a = _config->A();
		float val = a[0];
		for (uint8_t i = 1; i <= _config->Degree; i++)
			val += a[i] * powf(x, i);
		if (val < _config->MinValue)
			val = _config->MinValue;
		else if (val > _config->MaxValue)
			val = _config->MaxValue;
		return ScalarVariable(val);
	}

	IOperationBase *Operation_Polynomial::Create(Service::ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut)
	{
		const Operation_PolynomialConfig *polynomialConfig = reinterpret_cast<const Operation_PolynomialConfig *>(config);
		sizeOut += polynomialConfig->Size();
		return new Operation_Polynomial(polynomialConfig);
	}

	IOPERATION_REGISTERFACTORY_CPP(Operation_Polynomial, 1)
}
#endif