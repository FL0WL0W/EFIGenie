#include "HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "math.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H) && defined(IFLOATOUTPUTSERVICE_H)
#define FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
namespace IOService
{
	template<unsigned char Degree>
	struct __attribute__((__packed__)) FloatOutputService_PwmPolynomialConfig
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
		
		unsigned char PwmPin;
		float A[Degree + 1];
		float MinPulseWidth;
		float MaxPulseWidth;
		unsigned short Frequency;
	};

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

			if (pwmValue > _config->MaxPulseWidth)
				pwmValue = _config->MaxPulseWidth;
			else if (pwmValue < _config->MinPulseWidth)
				pwmValue = _config->MinPulseWidth;

			_hardwareAbstractionCollection->PwmService->WritePin(_config->PwmPin, { 1 / _config->Frequency, pwmValue / _config->Frequency });
		}
	};
}
#endif