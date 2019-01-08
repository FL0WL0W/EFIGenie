#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "IFloatInputService.h"
#include "math.h"
#include "Packed.h"

using namespace HardwareAbstraction;

#if !defined(FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H) && defined(IFLOATINPUTSERVICE_H) && defined(HARDWAREABSTRACTIONCOLLECTION_H)
#define FLOATINPUTSERVICE_ANALOGPOLYNOMIAL_H
namespace IOServices
{
	PACK(
	template<unsigned char Degree>
	struct FloatInputService_AnalogPolynomialConfig
	{
	private:
		FloatInputService_AnalogPolynomialConfig()
		{
			
		}
		
	public:
		static FloatInputService_AnalogPolynomialConfig<Degree>* Cast(void *p)
		{
			return (FloatInputService_AnalogPolynomialConfig<Degree> *)p;
		}
		
		unsigned int Size()
		{
			return sizeof(FloatInputService_AnalogPolynomialConfig<Degree>);
		}
		
		unsigned short AdcPin;
		float A[Degree+1];
		float MinValue;
		float MaxValue;
		unsigned short DotSampleRate;
	});
	
	template<unsigned char Degree>
	class FloatInputService_AnalogPolynomial : public IFloatInputService
	{
	protected:
		const HardwareAbstractionCollection *_hardwareAbstractionCollection;
		const FloatInputService_AnalogPolynomialConfig<Degree> *_config;
		
		unsigned int _lastReadTick = 0;
		float _lastValue = 0;
		
	public:
		FloatInputService_AnalogPolynomial(const HardwareAbstractionCollection *hardwareAbstractionCollection, const FloatInputService_AnalogPolynomialConfig<Degree> *config)
		{
			_hardwareAbstractionCollection = hardwareAbstractionCollection;
			_config = config;

			_hardwareAbstractionCollection->AnalogService->InitPin(_config->AdcPin);
		}

		void ReadValue()
		{
			float adcValue = _hardwareAbstractionCollection->AnalogService->ReadPin(_config->AdcPin);
			Value = _config->A[0];
			for (int i = 1; i <= Degree; i++)
				Value += _config->A[i] * pow(adcValue, i);
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