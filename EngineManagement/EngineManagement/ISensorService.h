#define ISensorServiceExists
namespace EngineManagement
{
	class ISensorService
	{
	public:
		virtual void ReadValue() = 0;
		float Value = 0;
		float ValueDot = 0;
	};
	
	ISensorService* CreateSensorService(void *config);
}