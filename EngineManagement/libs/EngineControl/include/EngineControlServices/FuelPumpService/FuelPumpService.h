#include "EngineControlServices/FuelPumpService/IFuelPumpService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "HardwareAbstraction/ITimerService.h"
#include "Packed.h"

using namespace IOServices;
using namespace HardwareAbstraction;

#if !defined(FUELPUMPSERVICE_H) && defined(IFUELPUMPSERVICE_H)
#define FUELPUMPSERVICE_H
namespace EngineControlServices
{
	PACK(
	struct FuelPumpServiceConfig
	{
	private:
		FuelPumpServiceConfig()
		{
			
		}
	public:
		static FuelPumpServiceConfig* Cast(void *p)
		{
			return (FuelPumpServiceConfig*)p;
		}
		unsigned int Size()
		{
			return sizeof(FuelPumpServiceConfig);
		}
		float PrimeTime;
	});
	
	class FuelPumpService : public IFuelPumpService
	{
		const FuelPumpServiceConfig *_config;
		ITimerService *_timerService;
		IBooleanOutputService *_outputService;
		
	public:
		bool Started = false;
		FuelPumpService(const FuelPumpServiceConfig *config, ITimerService *timerService, IBooleanOutputService *outputService);
		void Prime();
		void On();
		void Off();
		void Tick();
		static void PrimeTaskOff(void *parameter);
	};
}
#endif