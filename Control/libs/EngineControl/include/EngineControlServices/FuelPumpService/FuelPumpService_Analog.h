#include "EngineControlServices/FuelPumpService/IFuelPumpService.h"
#include "IOServices/FloatOutputService/IFloatOutputService.h"
#include "IOServices/FloatInputService/IFloatInputService.h"
#include "Interpolation.h"
#include "Reluctor/IReluctor.h"
#include "Packed.h"
#include "math.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Reluctor;
using namespace Interpolation;

#if !defined(FUELPUMPSERVICE_ANALOG_H) && defined(IFUELPUMPSERVICE_H)
#define FUELPUMPSERVICE_ANALOG_H
namespace EngineControlServices
{	
	PACK(
	struct FuelPumpService_AnalogConfig
	{
	private:
		FuelPumpService_AnalogConfig()
		{
		}
	public:
		constexpr const unsigned int Size() const
		{
			return sizeof(FuelPumpService_AnalogConfig) +
				sizeof(unsigned char) * RpmRes * YRes;
		}
		const float *AnalogTable() const { return (const float *)(this + 1); }

		float PrimeValue;
		float PrimeTime;
			
		bool UseTps;
		
		unsigned short MaxRpm;
		float MaxY;
		unsigned char RpmRes;
		unsigned char YRes;
	});
	
	class FuelPumpService_Analog : public IFuelPumpService
	{
		const FuelPumpService_AnalogConfig *_config;
		ITimerService *_timerService;
		IFloatOutputService *_outputService;
		IReluctor *_reluctor;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_throttlePositionService;

		float _currentValue;
		bool _isOn;
	public:
		bool Started = false;
		FuelPumpService_Analog(const FuelPumpService_AnalogConfig *config, ITimerService *timerService, IFloatOutputService *outputService, IReluctor *reluctor, IFloatInputService *manifoldAbsolutePressureService, IFloatInputService *throttlePositionService);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}
#endif