#if defined(ISensorServiceExists)
#define SensoreService_StaticExists
namespace EngineManagement
{
	class SensorService_Static : public ISensorService
	{
	public:
		SensorService_Static(float value, float valueDot) { Value = value; ValueDot = valueDot; }
		void ReadValue() { };
	};
}
#endif