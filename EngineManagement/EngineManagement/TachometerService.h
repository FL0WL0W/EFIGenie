#include "IOServiceCollection.h"

#if !defined(TACHOMETERSERVICE_H) && defined(IDECODER_H)
#define TACHOMETERSERVICE_H

namespace ApplicationServiceLayer
{
	struct __attribute__((__packed__)) TachometerServiceConfig
	{
	private:
		TachometerServiceConfig()
		{
			
		}
	public:
		TachometerServiceConfig* Cast(void *p)
		{
			return (TachometerServiceConfig *)p;
		}
		unsigned char DigitalPin;
		unsigned char PulsesPer2Rpm;
	};
	
	class TachometerService
	{
	protected:
		HardwareAbstraction::Task *TachometerTask;
		
		const IOServiceLayer::IOServiceCollection *_IOServiceCollection;
		const TachometerServiceConfig *_config;
		bool _pinHighZ;
		
		unsigned short _ticksPerRpm;
		bool _pinStatus;
	public:
		TachometerService(const IOServiceLayer::IOServiceCollection *iOServiceCollection, const TachometerServiceConfig *config, const bool highZ);
		static void TogglePinTask(void *parameters);
	};
}
#endif