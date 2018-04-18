#include "IFuelTrimService.h"

#if !defined(FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H) && defined(IFUELTRIMSERVICE_H)
#define FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
namespace ApplicationService
{
	struct __attribute__((__packed__)) FuelTrimServiceWrapper_MultiChannelConfig
	{
	private:
		FuelTrimServiceWrapper_MultiChannelConfig()
		{

		}
	public:
		static FuelTrimServiceWrapper_MultiChannelConfig* Cast(void *p)
		{
			FuelTrimServiceWrapper_MultiChannelConfig *ret = (FuelTrimServiceWrapper_MultiChannelConfig *)p;

			ret->FuelTrimChannelMask = (unsigned short *)(ret + 1);

			return ret;
		}
		unsigned int Size()
		{
			return sizeof(FuelTrimServiceWrapper_MultiChannelConfig) +
				sizeof(unsigned short) * NumberOfFuelTrimChannels;
		}
		unsigned char NumberOfFuelTrimChannels;
		unsigned short *FuelTrimChannelMask;
	};
	
	class FuelTrimServiceWrapper_MultiChannel : public IFuelTrimService
	{
	protected:
		const FuelTrimServiceWrapper_MultiChannelConfig *_config;
		
		IFuelTrimService **_fuelTrimChannels;
	public:
		FuelTrimServiceWrapper_MultiChannel(const FuelTrimServiceWrapper_MultiChannelConfig *config, IFuelTrimService **fuelTrimChannels);
		short GetFuelTrim(unsigned char cylinder);
		void Tick();
	};
}
#endif