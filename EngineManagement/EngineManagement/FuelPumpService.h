#include "IFuelPumpService.h"
#include "IBooleanOutputService.h"
#include "ITimerService.h"

using namespace IOService;
using namespace HardwareAbstraction;

#if !defined(FUELPUMPSERVICE_H) && defined(IFUELPUMPSERVICE_H)
#define FUELPUMPSERVICE_H
namespace ApplicationService
{
	struct __attribute__((__packed__)) FuelPumpServiceConfig
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
	};
	
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