#include "Services.h"
#include "FuelTrimServiceWrapper_MultiChannel.h"

#ifdef FuelTrimServiceWrapper_MultiChannelExists
namespace EngineManagement
{
	FuelTrimServiceWrapper_MultiChannel::FuelTrimServiceWrapper_MultiChannel(void *config)
	{
		//TODO: config
	}
	
	short FuelTrimServiceWrapper_MultiChannel::GetFuelTrim(unsigned char cylinder)
	{
		unsigned char fuelTrimsAdded = 0;
		int fuelTrim = 0;
		for (int i = 0; i < _numberOfFuelTrimChannels; i++)
		{
			if (_fuelTrimChannelMask[i] & (1 << cylinder))
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
	
	void FuelTrimServiceWrapper_MultiChannel::TrimTick()
	{
		for (int i = 0; i < _numberOfFuelTrimChannels; i++)
			_fuelTrimChannels[i]->TrimTick();
	}
}
#endif