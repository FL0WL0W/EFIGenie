#define MAX_CYLINDERS 12

namespace EngineManagement
{
	class PistonEngineConfig
	{
	public:
		PistonEngineConfig(void *config)
		{
			Cylinders = *((unsigned char *)config);
			config = (void *)(((unsigned char *)config) + 1);
			
			MlPerCylinder = *((unsigned short *)config);
			config = (void *)(((unsigned short *)config) + 1);
			
			MaxRpm = *((unsigned short *)config);
			config = (void *)(((unsigned short *)config) + 1);
		}
		unsigned char Cylinders;
		unsigned short MlPerCylinder;
		unsigned short MaxRpm;
	};
}