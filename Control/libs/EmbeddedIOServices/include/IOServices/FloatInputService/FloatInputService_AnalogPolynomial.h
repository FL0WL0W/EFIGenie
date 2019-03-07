#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "math.h"
#include "Packed.h"
#include "stdint.h"

using namespace HardwareAbstraction;

#if !defined(FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H) && defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
namespace IOServices
{
	PACK(
	template<uint8_t Degree>
	struct FloatInputService_AnalogPolynomialConfig
	{
	public:		
		constexpr const unsigned int Size() const
		{
			return sizeof(FloatInputService_AnalogPolynomialConfig<Degree>);
		}
		
		uint16_t AdcPin;
		uint16_t DotSampleRate;
		float A[Degree+1];
		float MinValue;
		float MaxValue;
	});
	
	template<uint8_t Degree>
	class FloatInputService_AnalogPolynomial : public IFloatInputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatInputService_AnalogPolynomialConfig<Degree> *_config;
		
		uint32_t _lastReadTick = 0;
		float _lastValue = 0;
		
	public:
		FloatInputService_AnalogPolynomial(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_AnalogPolynomialConfig<Degree> *config)
		{
			_hardwareAbstractionCollection = hardwareAbstractionCollection;
			_config = config;

			_hardwareAbstractionCollection->AnalogService->InitPin(_config->AdcPin);
		}

		void ReadValue() override
		{
			float adcValue = _hardwareAbstractionCollection->AnalogService->ReadPin(_config->AdcPin);
			Value = _config->A[0];
			for (uint8_t i = 1; i <= Degree; i++)
				Value += _config->A[i] * powf(adcValue, i);
			if (Value < _config->MinValue)
				Value = _config->MinValue;
			else if (Value > _config->MaxValue)
				Value = _config->MaxValue;

			float elapsedTime = _hardwareAbstractionCollection->TimerService->GetElapsedTime(_lastReadTick);
			if (elapsedTime * _config->DotSampleRate < 1.0)
				return;

			_lastReadTick = _hardwareAbstractionCollection->TimerService->GetTick();
			ValueDot = (Value - _lastValue) / elapsedTime;
			_lastValue = Value;
		}
	};
}
#endif
