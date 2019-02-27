#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatOutputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H) && defined(IFLOATOUTPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATOUTPUTSERVICE_PWMPOLYNOMIAL_H
namespace IOServices
{
	PACK(
	template<uint8_t Degree>
	struct FloatOutputService_PwmPolynomialConfig
	{
	public:
		constexpr const uint32_t Size() const
		{
			return sizeof(FloatOutputService_PwmPolynomialConfig<Degree>);
		}
		
		uint16_t PwmPin;
		uint16_t Frequency;
		float A[Degree+1];
		float MinDutyCycle;
		float MaxDutyCycle;
	});

	template<uint8_t Degree>
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
		
		void SetOutput(float value) override
		{
			float pwmValue = _config->A[0];
			for (uint8_t i = 1; i <= Degree; i++)
				pwmValue += _config->A[i] * powf(value, i);

			if (pwmValue > _config->MaxDutyCycle)
				pwmValue = _config->MaxDutyCycle;
			else if (pwmValue < _config->MinDutyCycle)
				pwmValue = _config->MinDutyCycle;

			_hardwareAbstractionCollection->PwmService->WritePin(_config->PwmPin, { 1.0f / _config->Frequency, pwmValue / _config->Frequency });
		}

		void Calibrate() override { }
	};
}
#endif
