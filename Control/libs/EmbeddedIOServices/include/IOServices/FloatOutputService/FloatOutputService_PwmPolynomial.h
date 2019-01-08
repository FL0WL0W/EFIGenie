#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H) && defined(IFLOATOUTPUTSERVICE_H)
#define FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
namespace IOServices
{
	PACK(
	template<unsigned char Degree>
	struct FloatOutputService_PwmPolynomialConfig
	{
	private:
		FloatOutputService_PwmPolynomialConfig()
		{
			
		}
		
	public:
		static FloatOutputService_PwmPolynomialConfig* Cast(void *p)
		{
			return (FloatOutputService_PwmPolynomialConfig *)p;
		}
			
		unsigned int Size()
		{
			return sizeof(FloatOutputService_PwmPolynomialConfig<Degree>);
		}
		
		unsigned short PwmPin;
		float A[Degree+1];
		float MinDutyCycle;
		float MaxDutyCycle;
		unsigned short Frequency;
	});

	template<unsigned char Degree>
	class FloatOutputService_PwmPolynomial : public IFloatOutputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatOutputService_PwmPolynomialConfig<Degree> *_config;

	public:
		FloatOutputService_PwmPolynomial(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatOutputService_PwmPolynomialConfig<Degree> *config)
		{
			_hardwareAbstractionCollection = hardwareAbstractionCollection;
			_config = config;

			_hardwareAbstractionCollection->PwmService->InitPin(_config->PwmPin, HardwareAbstraction::Out, _config->Frequency);
		}
		
		void SetOutput(float value)
		{
			float pwmValue = _config->A[0];
			for (int i = 1; i <= Degree; i++)
				pwmValue += _config->A[i] * pow(value, i);

			if (pwmValue > _config->MaxDutyCycle)
				pwmValue = _config->MaxDutyCycle;
			else if (pwmValue < _config->MinDutyCycle)
				pwmValue = _config->MinDutyCycle;

			_hardwareAbstractionCollection->PwmService->WritePin(_config->PwmPin, { 1.0f / _config->Frequency, pwmValue / _config->Frequency });
		}

		void Calibrate() { }
	};
}
#endif