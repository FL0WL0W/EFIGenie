#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IOServices/StepperOutputService/IStepperOutputService.h"
#include "IFloatOutputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_STEPPERPOLYNOMIAL_H) && defined(IFLOATOUTPUTSERVICE_H) && defined(ISTEPPEROUTPUTSERVICE_H)
#define FLOATOUTPUTSERVICE_STEPPERPOLYNOMIAL_H
namespace IOServices
{
	PACK(
	template<uint8_t Degree>
	struct FloatOutputService_StepperPolynomialConfig
	{
	public:
		constexpr const uint32_t Size() const
		{
			return sizeof(FloatOutputService_StepperPolynomialConfig<Degree>);
		}
			
		float A[Degree+1];
		int32_t MinStepPosition;
		int32_t MaxStepPosition;
	});

	template<uint8_t Degree>
	class FloatOutputService_StepperPolynomial : public IFloatOutputService
	{
	protected:
		const FloatOutputService_StepperPolynomialConfig<Degree> *_config;

		IStepperOutputService *_stepperService;
		int32_t _currentStepPosition;
			
	public:
		FloatOutputService_StepperPolynomial(const FloatOutputService_StepperPolynomialConfig<Degree> *config, IStepperOutputService *stepperService)
		{
			_config = config;
			_stepperService = stepperService;
			_currentStepPosition = 0;
		}
			
		void SetOutput(float value) override
		{
			float newStepPosition = _config->A[0];
			for (uint8_t i = 1; i <= Degree; i++)
				newStepPosition += _config->A[i] * powf(value, i);
		
			if (newStepPosition > _config->MaxStepPosition)
				newStepPosition = static_cast<float>(_config->MaxStepPosition);
			else if (newStepPosition < _config->MinStepPosition)
				newStepPosition = static_cast<float>(_config->MinStepPosition);

			newStepPosition = round(newStepPosition);
		
			_stepperService->Step(static_cast<int32_t>(round(newStepPosition - _currentStepPosition)));
		
			_currentStepPosition = static_cast<int32_t>(round(newStepPosition));
		}

		void Calibrate() override
		{ 
			_stepperService->Calibrate();
		}
	};
}
#endif
