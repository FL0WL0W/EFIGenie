#include "stdlib.h"
#include "Services.h"
#include "FuelTrimServiceWrapper_MultiChannel.h"

#ifdef FuelTrimServiceWrapper_MultiChannelExists
namespace EngineManagement
{
	FuelTrimServiceWrapper_MultiChannel::FuelTrimServiceWrapper_MultiChannel(void *config)
	{
		void *origConfig = config;
		unsigned char _numberOfFuelTrimChannels = *(unsigned char *)config;
		config = (void*)((unsigned char *)config + 1);
		
#if MAX_CYLINDERS <= 8
		unsigned char *_fuelTrimChannelMask = (unsigned char *)config;
		config = (void*)((unsigned char *)config + _numberOfFuelTrimChannels);
#elif MAX_CYLINDERS <= 16
		unsigned short *_fuelTrimChannelMask = (unsigned short *)config;
		config = (void*)((unsigned short *)config + _numberOfFuelTrimChannels);
#endif
		_fuelTrimChannels = (IFuelTrimService **)malloc(sizeof(IFuelTrimService **) * _numberOfFuelTrimChannels);
		for (unsigned char i; i < _numberOfFuelTrimChannels; i++)
		{
			_fuelTrimChannels[i] = CreateFuelTrimService((void*)((unsigned int *)origConfig + *((unsigned int *)config)));
			config = (void*)((unsigned int *)config + _numberOfFuelTrimChannels);
		}
		IFuelTrimService **_fuelTrimChannels;
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