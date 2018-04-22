#ifndef PISTONENGINECONFIG_H
#define PISTONENGINECONFIG_H
namespace EngineManagement
{
	struct __attribute__((__packed__)) PistonEngineConfig
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
		unsigned char DecoderId;
	};
}
#endif