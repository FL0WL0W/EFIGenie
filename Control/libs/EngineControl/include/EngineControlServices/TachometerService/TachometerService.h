#include "HardwareAbstraction/ITimerService.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "Reluctor/IReluctor.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"

using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Reluctor;

#if !defined(TACHOMETERSERVICE_H) && defined(IRELUCTOR_H) && defined(ITIMERSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)
#define TACHOMETERSERVICE_H
namespace EngineControlServices
{
	PACK(
	struct TachometerServiceConfig
	{
	private:
		TachometerServiceConfig()
		{
			
		}
	public:
		const unsigned int Size() const
		{
			return sizeof(TachometerServiceConfig);
		}
		
		unsigned char PulsesPer2Rpm;
	});
	
	class TachometerService
	{
	protected:
		Task *TachometerTask;
		
		const TachometerServiceConfig *_config;
		IBooleanOutputService *_booleanOutputService;
		ITimerService *_timerService;
		IReluctor *_reluctor;
		
		unsigned short _ticksPerRpm;
		bool _pinStatus;
	public:
		TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, IReluctor *reluctor);
		static void TogglePinTask(void *parameters);
	};
}
#endif