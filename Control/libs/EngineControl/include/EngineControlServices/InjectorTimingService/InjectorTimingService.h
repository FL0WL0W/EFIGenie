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
			return sizeof(InjectorTimingServiceConfig);
		}
		constexpr const unsigned short *InjectorGramsPerMinute() const { return reinterpret_cast<const unsigned short *>(this + 1); }
		constexpr const short *ShortPulseAdder() const { return reinterpret_cast<const short *>(InjectorGramsPerMinute() + Injectors); }
		constexpr const short *Offset() const { return reinterpret_cast<const short *>(ShortPulseAdder() + ShortPulseAdderResolution); }
		
		unsigned char Injectors;
		
		unsigned short InjectorOpenPosition;

		float ShortPulseLimit;
		unsigned char ShortPulseAdderResolution;
		
		float VoltageMax;
		float VoltageMin;
		unsigned char OffsetMapMax;
		unsigned char OffsetMapResolution;
		unsigned char OffsetVoltageResolution;
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