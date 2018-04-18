#include "ITimerService.h"
#include "HardwareAbstractionCollection.h"
#include "ServiceLocator.h"
#include "IDecoder.h"
#include "IBooleanOutputService.h"

using namespace HardwareAbstraction;
using namespace Service;
using namespace IOService;
using namespace Decoder;

#if !defined(TACHOMETERSERVICE_H) && defined(IDECODER_H) && defined(ITIMERSERVICE_H) && defined(IBOOLEANOUTPUTSERVICE_H)
#define TACHOMETERSERVICE_H
namespace ApplicationService
{
	struct __attribute__((__packed__)) TachometerServiceConfig
	{
	private:
		TachometerServiceConfig()
		{
			
		}
	public:
		static TachometerServiceConfig* Cast(void *p)
		{
			return (TachometerServiceConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(TachometerServiceConfig);
		}
		unsigned char PulsesPer2Rpm;
	};
	
	class TachometerService
	{
	protected:
		Task *TachometerTask;
		
		const TachometerServiceConfig *_config;
		IBooleanOutputService *_booleanOutputService;
		ITimerService *_timerService;
		IDecoder *_decoder;
		
		unsigned short _ticksPerRpm;
		bool _pinStatus;
	public:
		TachometerService(const TachometerServiceConfig *config, IBooleanOutputService *booleanOutputService, ITimerService *timerService, IDecoder *decoder);
		static void TogglePinTask(void *parameters);
	};
}
#endif