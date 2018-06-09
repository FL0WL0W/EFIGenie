#include "Packed.h"

#ifndef PISTONENGINECONFIG_H
#define PISTONENGINECONFIG_H
namespace EngineManagement
{
	PACK(
	struct PistonEngineConfig
	{
	private:
		PistonEngineConfig()
		{
			
		}
	public:
		static PistonEngineConfig* Cast(void *p)
		{
			return (PistonEngineConfig *)p;
		}
		unsigned int Size()
		{
			return sizeof(PistonEngineConfig);
		}
		
		unsigned char Cylinders;
		unsigned short Ml8thPerCylinder;
		bool IsThrottleBodyInjection;
		bool IsDistributor;
	});
}
#endif