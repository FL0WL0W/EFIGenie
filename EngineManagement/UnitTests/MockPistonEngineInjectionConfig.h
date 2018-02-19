namespace EngineManagement
{
	class MockPistonEngineInjectionConfig : public IPistonEngineInjectionConfig
	{
	public:
		MOCK_METHOD1(GetInjectorTiming, InjectorTiming(unsigned char));
	};
}