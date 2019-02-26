#include "stdlib.h"
#include "EngineControlServices/FuelTrimService/FuelTrimServiceWrapper_MultiChannel.h"

#ifdef FUELTRIMSERVICEWRAPPER_MULTICHANNEL_H
namespace EngineControlServices
{
	FuelTrimServiceWrapper_MultiChannel::FuelTrimServiceWrapper_MultiChannel(const FuelTrimServiceWrapper_MultiChannelConfig *config, IFuelTrimService **fuelTrimChannels)
	{
		_config = config;
		_fuelTrimChannels = fuelTrimChannels;
	}
	
	short FuelTrimServiceWrapper_MultiChannel::GetFuelTrim(unsigned char cylinder)
	{
		unsigned char fuelTrimsAdded = 0;
		int fuelTrim = 0;
		const unsigned short *fuelTrimChannelMask = _config->FuelTrimChannelMask();
		for (int i = 0; i < _config->NumberOfFuelTrimChannels; i++)
		{
			if (fuelTrimChannelMask[i] & (1 << cylinder))
			{
				short channelTrim = _fuelTrimChannels[i]->GetFuelTrim(cylinder);
				//if channelTrim is 0 then it might as well be off if it isn't actually off
				if (channelTrim != 0)
				{
					fuelTrimsAdded++;
					fuelTrim += channelTrim;
				}
			}
		}
		
		//if all channel trims were off then return 0
		if (fuelTrimsAdded == 0)
			return 0;
		
		//otherwise average all the channels.
		return fuelTrim / fuelTrimsAdded;
	}
	
	void FuelTrimServiceWrapper_MultiChannel::Tick()
	{
		for (int i = 0; i < _config->NumberOfFuelTrimChannels; i++)
			_fuelTrimChannels[i]->Tick();
	}
}
#endif