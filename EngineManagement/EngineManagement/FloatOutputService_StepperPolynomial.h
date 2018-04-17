#include "HardwareAbstractionCollection.h"
#include "IStepperService.h"
#include "IFloatOutputService.h"
#include "math.h"

#if !defined(FLOATOUTPUTSERVICE_STEPPERPOLYNOMIALCONFIG_H) && defined(IFLOATOUTPUTSERVICE_H)
#define FLOATOUTPUTSERVICE_STEPPERPOLYNOMIALCONFIG_H
namespace IOService
{
	template<unsigned char Degree>
		struct __attribute__((__packed__)) FloatOutputService_StepperPolynomialConfig
		{
		private:
			FloatOutputService_StepperPolynomialConfig()
			{
			
			}
		public:
			static FloatOutputService_StepperPolynomialConfig* Cast(void *p)
			{
				return (FloatOutputService_StepperPolynomialConfig *)p;
			}
			unsigned char StepperPin;
			float A[Degree + 1];
			float MinPulseWidth;
			float MaxPulseWidth;
			unsigned short Frequency;
		};

	template<unsigned char Degree>
		class FloatOutputService_StepperPolynomial : public IFloatOutputService
		{
			const HardwareAbstraction::HardwareAbstractionCollection *_hardwareAbstractionCollection;
			const FloatOutputService_StepperPolynomialConfig<Degree> *_config;

			IStepperService *_stepperService;
			int _currentStepPosition;
		public:
			FloatOutputService_StepperPolynomial(const HardwareAbstraction::HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_StepperPolynomialConfig<Degree> *config)
			{
				_hardwareAbstractionCollection = hardwareAbstractionCollection;
				_config = config;

				_stepperService = IStepperService::CreateStepperService(_hardwareAbstractionCollection, ((void *)(_config + 1)));
			}
			void SetOutput(float value)
			{
				float newStepPosition = _config->A[0];
				for (int i = 1; i <= Degree; i++)
					newStepPosition += _config->A[i] * pow(value, i);
		
				if (newStepPosition > _config->MaxStepPosition)
					newStepPosition = _config->MaxStepPosition;
				else if (newStepPosition < _config->MinStepPosition)
					newStepPosition = _config->MinStepPosition;
		
				_stepperService->Step(newStepPosition - _currentStepPosition);
		
				_currentStepPosition = newStepPosition;
			}
		};
}
#endif