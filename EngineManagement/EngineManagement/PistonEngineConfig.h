#define MAX_CYLINDERS 8

namespace EngineManagement
{
	class PistonEngineConfig
	{
	public:
		PistonEngineConfig(void *config)
		{
			Cylinders = *((unsigned char *)config);
			config = (void *)(((unsigned char *)config) + 1);
			
			Ml8thPerCylinder = *((unsigned short *)config); //1/8 ml
			config = (void *)(((unsigned short *)config) + 1);
			
			MaxRpm = *((unsigned short *)config);
			config = (void *)(((unsigned short *)config) + 1);
		}
		unsigned char Cylinders;
		unsigned short Ml8thPerCylinder;
		unsigned short MaxRpm;
	};
}