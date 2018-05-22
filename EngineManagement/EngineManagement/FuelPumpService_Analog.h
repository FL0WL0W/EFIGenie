#include "IFuelPumpService.h"
#include "IFloatOutputService.h"
#include "IFloatInputService.h"
#include "Interpolation.h"
#include "IDecoder.h"

using namespace HardwareAbstraction;
using namespace IOService;
using namespace Decoder;
using namespace Interpolation;

#if !defined(FUELPUMPSERVICE_ANALOG_H) && defined(IFUELPUMPSERVICE_H)
#define FUELPUMPSERVICE_ANALOG_H
namespace ApplicationService
{	
	struct __attribute__((__packed__)) FuelPumpService_AnalogConfig
	{
	private:
		FuelPumpService_AnalogConfig()
		{
		}
	public:
		static FuelPumpService_AnalogConfig* Cast(void *p)
		{
			FuelPumpService_AnalogConfig* ret = (FuelPumpService_AnalogConfig*)p;
			
			ret->AnalogTable = (unsigned char *)(ret + 1);
			
			return ret;
		}
		
		unsigned int Size()
		{
			return sizeof(FuelPumpService_AnalogConfig) +
				sizeof(unsigned char) * RpmRes * YRes;
		}

		float PrimeValue;
		float PrimeTime;
			
		bool UseTps;
		
		unsigned short MaxRpm;
		float MaxY;
		unsigned char RpmRes;
		unsigned char YRes;
		float *AnalogTable;
	};
	
	class FuelPumpService_Analog : public IFuelPumpService
	{
		const FuelPumpService_AnalogConfig *_config;
		ITimerService *_timerService;
		IFloatOutputService *_outputService;
		IDecoder *_decoder;
		IFloatInputService *_manifoldAbsolutePressureService;
		IFloatInputService *_throttlePositionService;

		unsigned char _currentValue;
		bool _isOn;
	public:
		bool Started = false;
		FuelPumpService_Analog(const FuelPumpService_AnalogConfig *config, ITimerService *timerService, IFloatOutputService *outputService, IDecoder *decoder, IFloatInputService *manifoldAbsolutePressureService, IFloatInputService *throttlePositionService);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}
#endif