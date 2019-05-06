#include "HardwareAbstraction/ITimerService.h"
#include "HardwareAbstraction/HardwareAbstractionCollection.h"
#include "Service/ServiceLocator.h"
#include "EngineControlServices/RpmService/RpmService.h"
#include "IOServices/BooleanOutputService/IBooleanOutputService.h"
#include "Packed.h"
#include "Service/ServiceLocator.h"

using namespace Service;
using namespace HardwareAbstraction;
using namespace IOServices;
using namespace Reluctor;

#if !defined(TACHOMETERSERVICE_H) && defined(RPMSERVICE_H) && defined(ITIMERSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)
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
		RpmService *_rpmService;
		
		unsigned short _ticksPerRpm;
		bool _pinStatus;
	public:
		TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, RpmService *rpmService);
		static void TogglePinTask(void *parameters);
		static void *CreateTachometerService(const ServiceLocator * const &serviceLocator, const void *config, unsigned int &sizeOut);
	};
}
#endif