#include "EngineControlServices/InjectorGramService/IInjectorGramService.h"
#include "EngineControlServices/InjectorTimingService/IInjectorTimingService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Interpolation.h"
#include "Packed.h"
#include "stdlib.h"

using namespace IOServices;
using namespace Interpolation;

#if !defined(INJECTORTIMINGSERVICE_H) && defined(IINJECTORTIMINGSERVICE_H) && defined(IINJECTORGRAMSERVICE_H)
#define INJECTORTIMINGSERVICE_H
namespace EngineControlServices
{	
	PACK(
	struct InjectorTimingServiceConfig
	{
	private:
		InjectorTimingServiceConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(InjectorTimingServiceConfig)
			+ sizeof(uint16_t) * Injectors
			+ sizeof(int16_t) * ShortPulseAdderResolution
			+ sizeof(int16_t) * MapResolution * VoltageResolution;
		}
		constexpr const uint16_t *InjectorGramsPerMinute() const { return reinterpret_cast<const uint16_t *>(this + 1); }
		constexpr const int16_t *ShortPulseAdder() const { return reinterpret_cast<const int16_t *>(InjectorGramsPerMinute() + Injectors); }
		constexpr const int16_t *Offset() const { return reinterpret_cast<const int16_t *>(ShortPulseAdder() + ShortPulseAdderResolution); }
		
		uint8_t Injectors;
		
		float InjectorOpenPosition;

		int16_t ShortPulseLimit;
		uint8_t ShortPulseAdderResolution;
		
		float VoltageMax;
		float VoltageMin;
		float MapMax;
		uint8_t MapResolution;
		uint8_t VoltageResolution;
	});
	
class InjectorTimingService : public IInjectorTimingService
	{
	protected:
		const InjectorTimingServiceConfig *_config;
		IInjectorGramService *_injectorGramService;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_voltageService;
		
	public:
		InjectorTimingService(
			const InjectorTimingServiceConfig *config, 
			IInjectorGramService *injectorGramService,
			IFloatInputService *manifoldAbsolutePressureService,
			IFloatInputService *voltageService);
		void CalculateInjectorTiming() override;
	};
}
#endif